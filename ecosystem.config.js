module.exports = {
  apps : [{
    script: 'index.js',
    watch: '.'
  }],

  deploy : {
    production : {
      user : 'kapil@hirise-01',
      host : '143.198.102.134',
      ref  : 'origin/dev',
      repo : 'git@github.com:sales-service.git',
      path : '/home/kapil/sales-service',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    dev : {
      user : "node",
      host : "localhost",
      repo : "git@github.com:sales-service.git",
      ref  : "origin/dev",
      path : "/var/www/development",
      "post-deploy" : "pm2 start ecosystem.config.js --env development"
    }
  }
};
