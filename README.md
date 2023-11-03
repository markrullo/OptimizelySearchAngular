# Optimizely Search Angular
This project works together with https://github.com/markrullo/OptimizelySearchServer to provide a client side search experience for Optimizely.

* Calls the results endpoint and can set the max results
* Pulls the categories configured, and displays only those
* Allows filtering based on categories, and page types - This is dynamic based on the config of the block


These were our goals in the project:
* Create a client side search experience that required no post-backs
* Allow users to refine search results
* Allow users to filter by tagged categories
	* This list is dynamic based on the config in the block
* Allow users to filter by page types
* Enable better search metrics (previous vendor delivered solution did not do this)
* Create a block that can be re-used for more specific search scenarios like
	* Search only profiles on the site
	* Search departments only
* Refine the search experience on mobile