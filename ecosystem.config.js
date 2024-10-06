export default {
  apps: [
    {
      name: 'backend-api',         // Name of the application
      script: './server.js',       // Entry point of the application
      instances: 'max',            // Number of instances to run (use 'max' for all available CPU cores)
      exec_mode: 'cluster',        // Run in cluster mode for load balancing
      watch: true,                 // Restart the app when file changes
      env: {
        NODE_ENV: 'development',   // Development environment variables
      },
      env_production: {
        NODE_ENV: 'production',    // Production environment variables
      }
    }
  ]
};
