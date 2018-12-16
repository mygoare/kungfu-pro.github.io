(function () {
  // 增加一个插件, 用来处理 markdown 中 html 内的 code
  // 该功能主要是为了折叠一些长的 json 代码
  // 用到了 html5 的 details

  if (typeof (!$docsify) === 'undefined') {
    return;
  }

  function install(hook, vm) {
    hook.beforeEach((content) => {
      const regex = /<pre\s+data-lang="(\w+)">(.*)<\/pre>/mgs;
      let m = null;
      while ((m = regex.exec(content)) !== null) {
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        if (m !== null && m.length === 3) {
          const code = marked([(`\`\`\`${m[1]}`).trim(), m[2], '```'].join('\n'));
          content = content.replace(m[0], code);
        }
      }
      return content;
    });
  }
  $docsify.plugins = [].concat(install, $docsify.plugins);
}());
