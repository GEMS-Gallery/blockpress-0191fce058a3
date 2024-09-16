import Bool "mo:base/Bool";
import Func "mo:base/Func";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

import Array "mo:base/Array";
import Time "mo:base/Time";
import Option "mo:base/Option";

actor {
  // Define the Post type
  type Post = {
    id: Nat;
    title: Text;
    body: Text;
    author: Text;
    timestamp: Int;
    category: Text;
  };

  // Define the Category type
  type Category = {
    name: Text;
    description: Text;
  };

  // Initialize stable variable to store posts
  stable var posts : [Post] = [];
  stable var nextId : Nat = 0;

  // Define categories with descriptions
  let categories : [Category] = [
    { name = "Red Team"; description = "Offensive security tactics and strategies" },
    { name = "Pen Testing"; description = "Penetration testing methodologies and tools" },
    { name = "Exploit Dev"; description = "Vulnerability research and exploit development" },
    { name = "Cryptography"; description = "Encryption, decryption, and cipher discussions" },
    { name = "Social Engineering"; description = "Human-focused attack techniques" },
    { name = "CTF"; description = "Capture The Flag challenges and writeups" }
  ];

  // Function to create a new post
  public func createPost(title: Text, body: Text, author: Text, category: Text) : async Nat {
    let post : Post = {
      id = nextId;
      title = title;
      body = body;
      author = author;
      timestamp = Time.now();
      category = category;
    };
    posts := Array.append(posts, [post]);
    nextId += 1;
    nextId - 1
  };

  // Function to get all posts, sorted by timestamp (most recent first)
  public query func getPosts() : async [Post] {
    Array.sort(posts, func(a: Post, b: Post) : {#less; #equal; #greater} {
      if (a.timestamp > b.timestamp) { #less }
      else if (a.timestamp < b.timestamp) { #greater }
      else { #equal }
    })
  };

  // Function to get a single post by id
  public query func getPost(id: Nat) : async ?Post {
    Array.find(posts, func(post: Post) : Bool { post.id == id })
  };

  // Function to get all categories
  public query func getCategories() : async [Category] {
    categories
  };

  // Function to get posts by category
  public query func getPostsByCategory(category: Text) : async [Post] {
    Array.filter(posts, func(post: Post) : Bool { post.category == category })
  };
}
