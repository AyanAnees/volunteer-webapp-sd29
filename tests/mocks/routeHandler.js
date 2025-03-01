/**
 * Utility to find a route handler in Express routes stack
 * @param {Array} stack - Express routes stack
 * @param {string} method - HTTP method (get, post, put, delete)
 * @param {string} routePath - Path to match (e.g., '/user/:userId')
 * @returns {Function} - Route handler function
 */
function findRouteHandler(stack, method, routePath) {
  // Normalize method to lowercase
  const normalizedMethod = method.toLowerCase();
  
  // Try to find an exact match first
  let route = stack.find(layer => {
    if (!layer.route) return false;
    return layer.route.path === routePath && layer.route.methods[normalizedMethod];
  });
  
  // If no exact match, try parameterized matching
  if (!route) {
    route = stack.find(layer => {
      if (!layer.route) return false;
      
      // For paths with parameters (e.g., '/user/:userId')
      const layerPathSegments = layer.route.path.split('/').filter(Boolean);
      const routePathSegments = routePath.split('/').filter(Boolean);
      
      // If segments length doesn't match, it's not our route
      if (layerPathSegments.length !== routePathSegments.length) return false;
      
      // Check method matches
      if (!layer.route.methods[normalizedMethod]) return false;
      
      // Check each segment
      const matches = layerPathSegments.every((segment, index) => {
        // Parameter segment (starts with :) should match anything
        if (segment.startsWith(':')) return true;
        // For literal segments, check exact match
        return segment === routePathSegments[index];
      });
      
      return matches;
    });
    
    // Try prefix matching as a last resort
    if (!route) {
      route = stack.find(layer => {
        if (!layer.route) return false;
        return routePath.startsWith(layer.route.path) && layer.route.methods[normalizedMethod];
      });
    }
  }
  
  if (!route) {
    throw new Error(`Route handler not found for ${method.toUpperCase()} ${routePath}`);
  }
  
  return route.route.stack[0].handle;
}

module.exports = findRouteHandler;
