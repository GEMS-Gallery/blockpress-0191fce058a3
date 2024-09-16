import Bool "mo:base/Bool";
import Hash "mo:base/Hash";
import Int "mo:base/Int";
import Nat "mo:base/Nat";

import Array "mo:base/Array";
import Time "mo:base/Time";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

actor {
  type Post = {
    id: Nat;
    title: Text;
    body: Text;
    author: Text;
    timestamp: Int;
    category: Text;
  };

  type Category = {
    name: Text;
    description: Text;
  };

  type User = {
    principal: Principal;
    username: Text;
  };

  stable var posts : [Post] = [];
  stable var nextId : Nat = 0;
  stable var userEntries : [(Principal, User)] = [];

  let users = HashMap.fromIter<Principal, User>(userEntries.vals(), 10, Principal.equal, Principal.hash);

  let categories : [Category] = [
    { name = "Red Team"; description = "Offensive security tactics and strategies" },
    { name = "Pen Testing"; description = "Penetration testing methodologies and tools" },
    { name = "Exploit Dev"; description = "Vulnerability research and exploit development" },
    { name = "Cryptography"; description = "Encryption, decryption, and cipher discussions" },
    { name = "Social Engineering"; description = "Human-focused attack techniques" },
    { name = "CTF"; description = "Capture The Flag challenges and writeups" }
  ];

  public shared(msg) func createUser(username: Text) : async Bool {
    if (Option.isSome(users.get(msg.caller))) {
      return false; // User already exists
    };
    let newUser : User = {
      principal = msg.caller;
      username = username;
    };
    users.put(msg.caller, newUser);
    true
  };

  public shared(msg) func getUsername() : async ?Text {
    switch (users.get(msg.caller)) {
      case (null) { null };
      case (?user) { ?user.username };
    }
  };

  public shared(msg) func createPost(title: Text, body: Text, category: Text) : async ?Nat {
    switch (users.get(msg.caller)) {
      case (null) { null };
      case (?user) {
        let post : Post = {
          id = nextId;
          title = title;
          body = body;
          author = user.username;
          timestamp = Time.now();
          category = category;
        };
        posts := Array.append(posts, [post]);
        nextId += 1;
        ?(nextId - 1)
      };
    }
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

  public shared(msg) func getOwnPosts() : async [Post] {
    switch (users.get(msg.caller)) {
      case (null) { [] };
      case (?user) {
        Array.filter(posts, func(post: Post) : Bool { post.author == user.username })
      };
    }
  };

  public shared(msg) func updatePost(id: Nat, title: Text, body: Text, category: Text) : async Bool {
    switch (users.get(msg.caller)) {
      case (null) { false };
      case (?user) {
        posts := Array.map<Post, Post>(posts, func (post: Post) : Post {
          if (post.id == id and post.author == user.username) {
            {
              id = id;
              title = title;
              body = body;
              author = user.username;
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
  };

  system func preupgrade() {
    userEntries := Iter.toArray(users.entries());
  };

  system func postupgrade() {
    userEntries := [];
  };
}
