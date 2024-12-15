
// const YOUR_CONTENT_API_KEY='00d79e4a7f3a88837fa68e6fb5';

// const api = new GhostContentAPI({
//     // authenticate here
//     url: 'https://www.boardx.us',
//     key: YOUR_CONTENT_API_KEY,
//     version: "v5.0"
// });

const YOUR_CONTENT_API_KEY='95d51bbaa33425cbcf8b4de379';

    document.addEventListener("DOMContentLoaded", function () {
        // Initialize the Ghost Content API Client
        const api = new GhostContentAPI({
            // authenticate here
            url: 'http://localhost:2368',
            key: '4c05ba3e4cc29503d7daa24fc4',
            version: "v5.0"
        });
        /**
         * Utility function to get query parameters from the URL.
         * @param {string} param - The name of the parameter to retrieve.
         * @returns {string|null} - The value of the parameter or null if not found.
         */
        function getQueryParam(param) {
          const urlParams = new URLSearchParams(window.location.search);
          return urlParams.get(param);
        }
      
        /**
         * Function to show or hide the loading indicator.
         * @param {boolean} show - Whether to show the loading indicator.
         */
        function showLoading(show) {
          const loadingElement = document.getElementById("loading");
          loadingElement.style.display = show ? "block" : "none";
        }
      
        /**
         * Function to fetch posts by primary tag using Ghost Content API.
         * @param {string} tagSlug - The slug of the primary tag.
         * @returns {Promise<Array>} - A promise that resolves to an array of posts.
         */
        async function fetchPostsByPrimaryTag(tagSlug) {
          try {
            const posts = await api.posts.browse({
              filter: `tag:${tagSlug}`,
              include: 'tags,authors',
              limit: 200, // Maximum number of posts; adjust as needed
  
            });
            console.log(`Fetched ${posts.length} posts under tag "${tagSlug}"`);
            return posts;
          } catch (error) {
            console.error("Error fetching posts by primary tag:", error);
            return [];
          }
        }
      
        /**
         * Function to group posts by their secondary tags.
         * @param {Array} posts - An array of post objects.
         * @param {string} primaryTagSlug - The slug of the primary tag.
         * @returns {Object} - An object mapping secondary tag slugs to their respective posts.
         */
        function groupPostsBySecondaryTags(posts, primaryTagSlug) {
          const groups = {};
      
          posts.forEach(post => {
            // Extract secondary tags (exclude primary tag)
            const secondaryTags = post.tags.filter(tag => tag.slug !== primaryTagSlug && tag.name.indexOf('#') === -1);
      
            if (secondaryTags.length === 0) {
              // Handle posts with only the primary tag
              if (!groups['no-secondary-tags']) {
                groups['no-secondary-tags'] = {
                  name: 'Uncategorized', // You can customize this label
                  posts: []
                };
              }
              groups['no-secondary-tags'].posts.push(post);
            } else {
              secondaryTags.forEach(tag => {
                if (!groups[tag.slug]) {
                  groups[tag.slug] = {
                    name: tag.name,
                    posts: []
                  };
                }
                groups[tag.slug].posts.push(post);
              });
            }
          });
      
          return groups;
        }
      
        /**
         * Function to render the grouped posts menu in the sidebar.
         * @param {Object} groups - An object mapping secondary tag slugs to their respective posts.
         * @param {string} currentPostSlug - The slug of the currently selected post.
         * @param {string} primaryTagSlug - The slug of the primary tag.
         */
        function renderGroupedMenu(groups, currentPostSlug, primaryTagSlug) {
        
          const menu = document.getElementById("posts-menu");
          menu.innerHTML = ""; // Clear existing menu items
      
          Object.keys(groups).forEach(groupSlug => {
            const group = groups[groupSlug];
      
            // Create group container
            const groupItem = document.createElement("li");
      
            // Create group header
            const groupHeader = document.createElement("span");
            groupHeader.classList.add("group-name");
            groupHeader.textContent = group.name;
            groupItem.appendChild(groupHeader);
      
            // Create posts list under the group
            const postsList = document.createElement("ul");
      
            group.posts.forEach(post => {
              const postItem = document.createElement("li");
              const postLink = document.createElement("a");
              postLink.href = `?tag=${encodeURIComponent(primaryTagSlug)}&post=${encodeURIComponent(post.slug)}`;
              postLink.textContent = post.title;
      
              // Highlight the current post
              if (post.slug === currentPostSlug) {
                postLink.classList.add("active");
              }
      
              postItem.appendChild(postLink);
              postsList.appendChild(postItem);
            });
      
            groupItem.appendChild(postsList);
            menu.appendChild(groupItem);
          });
      
          console.log("Rendered grouped menu with tags:", Object.keys(groups));
        }
      
        /**
         * Function to fetch and render a single post by slug within the primary tag.
         * @param {string} tagSlug - The slug of the primary tag.
         * @param {string} postSlug - The slug of the post to fetch.
         * @returns {Promise<Object|null>} - The fetched post object or null if not found.
         */
        async function fetchAndRenderPost(tagSlug, postSlug) {
          try {
            console.log(`Fetching post "${postSlug}" under tag "${tagSlug}"`);
            const posts = await api.posts.browse({
              filter: `tag:${tagSlug}+slug:${postSlug}`,
              include: 'tags,authors',
              limit: 1,
       
            });
      
            if (posts.length > 0) {
              console.log(`Post "${postSlug}" fetched successfully.`);
              return posts[0];
            } else {
              console.warn(`No post found with slug "${postSlug}" under tag "${tagSlug}".`);
              return null;
            }
          } catch (error) {
            console.error("Error fetching post by slug:", error);
            return null;
          }
        }
      
        /**
         * Function to render the selected post's content.
         * @param {Object|null} post - The post object to display.
         */
        function renderPost(post) {
          const titleElement = document.getElementById("post-title");
          const contentElement = document.getElementById("post-content");
      
          if (post) {
            titleElement.textContent = post.title;
            contentElement.innerHTML = post.html; // Using HTML content
            console.log(`Rendered post "${post.slug}"`);
          } else {
            titleElement.textContent = "Post Not Found";
            contentElement.innerHTML = "<p>The requested post could not be found.</p>";
            console.warn("Attempted to render a post that was not found.");
          }
        }
      
        /**
         * Function to update the header with the current primary tag's name.
         * @param {Array} posts - An array of post objects.
         * @param {string} tagSlug - The slug of the primary tag.
         */
        function updateHeader(posts, tagSlug) {
          const headerElement = document.getElementById("posts-header");
          if (posts.length > 0) {
            // Find the first post's tag that matches the tagSlug to get the display name
            const tag = posts[0].tags.find(t => t.slug === tagSlug);
            const tagName = tag ? tag.name : tagSlug;
            headerElement.textContent = `Posts under "${tagName}"`;
            console.log(`Updated header to display tag name "${tagName}"`);
          } else {
            headerElement.textContent = `Posts under "${tagSlug}"`;
            console.log(`Updated header to display tag slug "${tagSlug}"`);
          }
        }
      
        /**
         * Main function to orchestrate fetching and rendering.
         */
        async function main() {
          showLoading(true); // Show loading indicator
      
          const primaryTagSlug = getQueryParam("tag");
          const postSlug = getQueryParam("post");
      
          console.log(`URL Parameters - Tag: "${primaryTagSlug}", Post: "${postSlug}"`);
      
          if (!primaryTagSlug) {
            // Handle the case where no primary tag is specified
            document.getElementById("post-title").textContent = "No Tag Specified";
            document.getElementById("post-content").innerHTML = "<p>Please specify a tag in the URL.</p>";
            showLoading(false);
            return;
          }
      
          // Fetch posts by primary tag
          const posts = await fetchPostsByPrimaryTag(primaryTagSlug);
      
          if (posts.length === 0) {
            document.getElementById("post-title").textContent = "No Posts Found";
            document.getElementById("post-content").innerHTML = "<p>No posts are available under this tag.</p>";
            showLoading(false);
            return;
          }
      
          // Update the header with the primary tag name
          updateHeader(posts, primaryTagSlug);
      
          // Group posts by their secondary tags
          const groupedPosts = groupPostsBySecondaryTags(posts, primaryTagSlug);
      
          // Render the grouped menu
          renderGroupedMenu(groupedPosts, postSlug, primaryTagSlug);
      
          // Determine the post to display
          let selectedPost;
          let selectedPostSlug = postSlug;
      
          if (!postSlug) {
            // If no post is specified, default to the first post in the first group
            const firstGroupSlug = Object.keys(groupedPosts)[0];
            const firstGroup = groupedPosts[firstGroupSlug];
            selectedPost = firstGroup.posts[0];
            selectedPostSlug = selectedPost.slug;
      
            // Update the URL without reloading the page
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set("post", selectedPostSlug);
            window.history.replaceState({}, "", newUrl);
            console.log(`No post specified. Defaulting to the first post "${selectedPostSlug}"`);
          } else {
            // Fetch and render the specified post
            selectedPost = await fetchAndRenderPost(primaryTagSlug, selectedPostSlug);
            if (!selectedPost) {
              // If the specified post slug is invalid or doesn't belong to the primary tag, default to the first post
              const firstGroupSlug = Object.keys(groupedPosts)[0];
              const firstGroup = groupedPosts[firstGroupSlug];
              selectedPost = firstGroup.posts[0];
              selectedPostSlug = selectedPost.slug;
      
              // Update the URL without reloading the page
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.set("post", selectedPostSlug);
              window.history.replaceState({}, "", newUrl);
              console.warn(`Post "${postSlug}" not found under tag "${primaryTagSlug}". Defaulting to "${selectedPostSlug}"`);
            }
          }
      
          // Render the selected post's content
          renderPost(selectedPost);
      
          showLoading(false); // Hide loading indicator
      
          // Handle menu item clicks to switch posts without reloading
          const menuLinks = document.querySelectorAll("#posts-menu li ul li a");
          menuLinks.forEach(link => {
            link.addEventListener("click", async function (e) {
              e.preventDefault();
              const newPostSlug = this.getAttribute("href").split("post=")[1];
      
              console.log(`Menu clicked. New Post Slug: "${newPostSlug}"`);
      
              showLoading(true); // Show loading indicator
      
              // Fetch the new post
              const newPost = await fetchAndRenderPost(primaryTagSlug, newPostSlug);
              if (newPost) {
                // Update the content
                renderPost(newPost);
      
                // Update the active link
                menuLinks.forEach(l => l.classList.remove("active"));
                this.classList.add("active");
      
                // Update the URL
                const updatedUrl = new URL(window.location.href);
                updatedUrl.searchParams.set("post", newPostSlug);
                window.history.pushState({}, "", updatedUrl);
      
                console.log(`Post "${newPostSlug}" rendered and URL updated.`);
              } else {
                // If the post isn't found, inform the user
                renderPost(null);
                console.warn(`Post "${newPostSlug}" could not be rendered.`);
              }
      
              showLoading(false); // Hide loading indicator
            });
          });
      
          // Handle browser navigation (back/forward buttons)
          window.addEventListener("popstate", async function () {
            showLoading(true); // Show loading indicator
      
            const currentTagSlug = getQueryParam("tag");
            const currentPostSlug = getQueryParam("post");
      
            console.log(`Popstate event. Tag: "${currentTagSlug}", Post: "${currentPostSlug}"`);
      
            if (currentTagSlug) {
              const currentPosts = await fetchPostsByPrimaryTag(currentTagSlug);
              if (currentPosts.length > 0) {
                updateHeader(currentPosts, currentTagSlug);
                const currentGroupedPosts = groupPostsBySecondaryTags(currentPosts, currentTagSlug);
                renderGroupedMenu(currentGroupedPosts, currentPostSlug, currentTagSlug);
                const currentPost = await fetchAndRenderPost(currentTagSlug, currentPostSlug);
                renderPost(currentPost);
              } else {
                // If no posts found for the tag during popstate
                document.getElementById("post-title").textContent = "No Posts Found";
                document.getElementById("post-content").innerHTML = "<p>No posts are available under this tag.</p>";
                console.warn(`No posts found under tag "${currentTagSlug}" during popstate.`);
              }
            }
      
            showLoading(false); // Hide loading indicator
          });
        }
      
        // Invoke the main function to start the process
        main();
      });
      