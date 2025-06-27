Please read the instructions below carefully.
Objective
Build a simplified Community App that allows users to register, create groups, and post content within those groups.Unauthenticated users should be able to view all posts, but only authenticated users can post or create groups.
Features to Implement
1. User Authentication
Allow users to register and log in securely.Use token-based authentication.Store user details such as name, email, and password.
2. Groups
Authenticated users can create groups (e.g., name and description).Each group should be tied to the user who created it.
3. Posts
Authenticated users can create posts inside groups they created.Each post must be linked to a group and the user who posted it.
4. Public Feed
Unauthenticated users should be able to view a feed of all posts across all groups.Only logged-in users can create groups or post content.
Tech Stack Requirements
Backend: Django +  Django Rest FrameworkDatabase: MySQLFrontend: React + Tailwind CSS