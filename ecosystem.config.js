module.exports = {
  apps: [{
    script: 'out/app.js',
    watch: '.'
  }],

  deploy: {
    production: {
      user: 'debian',
      host: '51.178.45.66',
      ref: 'origin/main',
      repo: 'git@github.com:BillyRonico412/sudoku-solver-back.git',
      path: '/home/debian/pm2',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js',
      'pre-setup': ''
    }
  }
};
