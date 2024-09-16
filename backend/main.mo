import Bool "mo:base/Bool";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

import Array "mo:base/Array";
import Time "mo:base/Time";
import Option "mo:base/Option";
import Principal "mo:base/Principal";

actor {
  type Post = {
    id: Nat;
    title: Text;
    body: Text;
    author: Principal;
    timestamp: Int;
    category: Text;
  };

  type Category = {
    name: Text;
    description: Text;
  };

  stable var posts : [Post] = [];
  stable var nextId : Nat = 0;

  let categories : [Category] = [
    { name = "Red Team"; description = "Offensive security tactics and strategies" },
    { name = "Pen Testing"; description = "Penetration testing methodologies and tools" },
    { name = "Exploit Dev"; description = "Vulnerability research and exploit development" },
    { name = "Cryptography"; description = "Encryption, decryption, and cipher discussions" },
    { name = "Social Engineering"; description = "Human-focused attack techniques" },
    { name = "CTF"; description = "Capture The Flag challenges and writeups" }
  ];

  public shared(msg) func createPost(title: Text, body: Text, category: Text) : async Nat {
    let post : Post = {
      id = nextId;
      title = title;
      body = body;
      author = msg.caller;
      timestamp = Time.now();
      category = category;
    };
    posts := Array.append(posts, [post]);
    nextId += 1;
    nextId - 1
  };

  public query func getPosts() : async [Post] {
    Array.sort(posts, func(a: Post, b: Post) : {#less; #equal; #greater} {
      if (a.timestamp > b.timestamp) { #less }
      else if (a.timestamp < b.timestamp) { #greater }
      else { #equal }
    })
  };

  public query func getPost(id: Nat) : async ?Post {
    Array.find(posts, func(post: Post) : Bool { post.id == id })
  };

  public query func getCategories() : async [Category] {
    categories
  };

  public query func getPostsByCategory(category: Text) : async [Post] {
    Array.filter(posts, func(post: Post) : Bool { post.category == category })
  };

  public query({caller}) func getOwnPosts() : async [Post] {
    Array.filter(posts, func(post: Post) : Bool { post.author == caller })
  };

  public shared({caller}) func updatePost(id: Nat, title: Text, body: Text, category: Text) : async Bool {
    posts := Array.map<Post, Post>(posts, func (post: Post) : Post {
      if (post.id == id and post.author == caller) {
        {
          id = id;
          title = title;
          body = body;
          author = caller;
          timestamp = Time.now();
          category = category;
        }
      } else {
        post
      }
    });
    true
  };
}
