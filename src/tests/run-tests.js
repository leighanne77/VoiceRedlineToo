const jest = require('jest');
const argv = process.argv.slice(2);

jest.runCLI({ projects: [process.cwd()] }, [process.cwd()])
  .then(({ results }) => {
    if (!results.success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });