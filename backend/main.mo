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

  // Initialize stable variable to store posts
  stable var posts : [Post] = [];
  stable var nextId : Nat = 0;

  // Define categories
  let categories : [Text] = ["Red Team", "Pen Testing", "Exploit Dev", "CTF", "Social Engineering", "Cryptography"];

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
  public query func getCategories() : async [Text] {
    categories
  };

  // Function to get posts by category
  public query func getPostsByCategory(category: Text) : async [Post] {
    Array.filter(posts, func(post: Post) : Bool { post.category == category })
  };
}
