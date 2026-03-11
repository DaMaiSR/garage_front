module.exports = {
  transpileDependencies: true,
  devServer: {
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: (error) => {
          if (!error || !error.message) {
            return true;
          }
          return ![
            "ResizeObserver loop completed with undelivered notifications.",
            "ResizeObserver loop limit exceeded"
          ].some((message) => error.message.includes(message));
        }
      }
    }
  }
};
