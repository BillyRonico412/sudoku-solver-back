module.exports = {
  apps: [{
    script: 'out/app.js',
    watch: '.'
  }, {
    script: './service-worker/',
    watch: ['./service-worker']
  }],

  deploy: {
    production: {
      user: 'debian',
      host: '51.178.45.66',
      ref: 'origin/master',
      repo: 'git@github.com:BillyRonico412/sudoku-solver-back.git',
      path: '/home/debian/pm2',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
