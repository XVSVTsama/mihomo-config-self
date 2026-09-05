const fs = require('fs');
const path = require('path');
const vm = require('vm');

const testCode = `
function scenario(options) {
  const entryKeys = [
    '入口解析',
    '电信入口解析',
    '联通入口解析',
    '移动入口解析'
  ];
  entryKeys.forEach((key) => {
    ruleOptionsEnable[key] = false;
  });
  Object.assign(ruleOptionsEnable, options || {});

  const config = JSON.parse(JSON.stringify(baseConfig));
  return main(config, 'test');
}

function assertEntryResolution(output, operatorName, expectedProxyCount) {
  const expectedSuffix = '#国内入口解析-' + operatorName;
  const expectedProxyName = '国内入口解析-' + operatorName;

  const nodeProxies = output.proxies.filter((proxy) => /^国内入口解析-/.test(proxy.name));
  if (nodeProxies.length !== expectedProxyCount) {
    throw new Error(
      'entry proxy count mismatch: ' + JSON.stringify(nodeProxies.map((proxy) => proxy.name))
    );
  }

  if (expectedProxyCount > 0) {
    const injected = output.proxies.find((proxy) => proxy.name === expectedProxyName);
    if (!injected) {
      throw new Error('missing expected entry proxy: ' + expectedProxyName);
    }

    const displayGroup = output['proxy-groups'].find(
      (group) => group && group.name === '国内入口解析'
    );
    if (!displayGroup) {
      throw new Error('missing display group: 国内入口解析');
    }
    if (displayGroup.type !== 'select') {
      throw new Error('display group type mismatch: ' + displayGroup.type);
    }
    if (
      !Array.isArray(displayGroup.proxies) ||
      displayGroup.proxies.length !== 1 ||
      displayGroup.proxies[0] !== expectedProxyName
    ) {
      throw new Error(
        'display group proxies mismatch: ' + JSON.stringify(displayGroup.proxies)
      );
    }

    const autoSelectIndex = output['proxy-groups'].findIndex(
      (group) => group && group.name === '♻️ 自动选择'
    );
    const displayGroupIndex = output['proxy-groups'].findIndex(
      (group) => group && group.name === '国内入口解析'
    );
    if (autoSelectIndex < 0 || displayGroupIndex <= autoSelectIndex) {
      throw new Error('display group is not inserted after ♻️ 自动选择');
    }

    output['proxy-groups'].forEach((group) => {
      if (
        group.name !== '国内入口解析' &&
        Array.isArray(group.proxies) &&
        group.proxies.includes(expectedProxyName)
      ) {
        throw new Error('entry proxy leaked into proxy group: ' + group.name);
      }
    });

    const routeReferences = output.rules.filter(
      (rule) => typeof rule === 'string' && rule.includes(',国内入口解析')
    );
    if (routeReferences.length > 0) {
      throw new Error('display group leaked into routing rules');
    }
  }

  for (const value of output.dns['proxy-server-nameserver']) {
    if (!value.endsWith(expectedSuffix)) {
      throw new Error('global nameserver suffix mismatch: ' + value);
    }
    if (value.includes('#') && !value.endsWith(expectedSuffix)) {
      throw new Error('global nameserver still has old suffix: ' + value);
    }
  }

  const policy = output.dns['proxy-server-nameserver-policy'] || {};
  for (const rule of Object.keys(policy)) {
    const values = Array.isArray(policy[rule]) ? policy[rule] : [policy[rule]];
    for (const value of values) {
      if (!value.endsWith(expectedSuffix)) {
        throw new Error('policy value suffix mismatch: ' + rule + ' -> ' + value);
      }
    }
  }
}

function assertUnchanged(output) {
  const nodeProxies = output.proxies.filter((proxy) => /^国内入口解析-/.test(proxy.name));
  if (nodeProxies.length !== 0) {
    throw new Error('entry proxy should not be injected');
  }

  const displayGroup = output['proxy-groups'].find(
    (group) => group && group.name === '国内入口解析'
  );
  if (displayGroup) {
    throw new Error('display group should not exist when entry resolution is disabled');
  }

  if (!output.dns['proxy-server-nameserver'].some((value) => value.includes('#DIRECT'))) {
    throw new Error('global nameserver was unexpectedly changed');
  }

  const policy = output.dns['proxy-server-nameserver-policy'] || {};
  for (const rule of Object.keys(policy)) {
    const values = Array.isArray(policy[rule]) ? policy[rule] : [policy[rule]];
    for (const value of values) {
      if (value.includes('#国内入口解析-')) {
        throw new Error('policy value was unexpectedly changed: ' + rule + ' -> ' + value);
      }
    }
  }
}

const baseConfig = {
  proxies: [
    {
      name: 'Subscription Node',
      type: 'ss',
      server: 'node.example.com',
      port: 443
    }
  ],
  dns: {
    'proxy-server-nameserver': [
      'https://private.example.com/dns-query#AirportDNS'
    ]
  }
};

assertUnchanged(scenario({
  '入口解析': false,
  '电信入口解析': true,
  '联通入口解析': true,
  '移动入口解析': true
}));

assertUnchanged(scenario({
  '入口解析': true
}));

assertEntryResolution(scenario({
  '入口解析': true,
  '电信入口解析': true,
  '联通入口解析': true,
  '移动入口解析': true
}), '电信', 1);

assertEntryResolution(scenario({
  '入口解析': true,
  '电信入口解析': false,
  '联通入口解析': true,
  '移动入口解析': true
}), '联通', 1);

assertEntryResolution(scenario({
  '入口解析': true,
  '电信入口解析': false,
  '联通入口解析': false,
  '移动入口解析': true
}), '移动', 1);
`;

function runTarget(targetName) {
  const source = fs.readFileSync(path.join(__dirname, targetName), 'utf8');
  const context = {
    console,
    JSON
  };
  vm.createContext(context);
  vm.runInContext(
    source + '\n' + testCode,
    context,
    { filename: targetName + '-entry-resolution-test.js' }
  );
}

runTarget('script_override.js');
runTarget('script_override_en.js');
console.log('entry resolution tests passed for both scripts');
