import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Category { 'name' : string, 'description' : string }
export interface Post {
  'id' : bigint,
  'title' : string,
  'body' : string,
  'author' : Principal,
  'timestamp' : bigint,
  'category' : string,
}
export interface _SERVICE {
  'createPost' : ActorMethod<[string, string, string], bigint>,
  'getCategories' : ActorMethod<[], Array<Category>>,
  'getOwnPosts' : ActorMethod<[], Array<Post>>,
  'getPost' : ActorMethod<[bigint], [] | [Post]>,
  'getPosts' : ActorMethod<[], Array<Post>>,
  'getPostsByCategory' : ActorMethod<[string], Array<Post>>,
  'updatePost' : ActorMethod<[bigint, string, string, string], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
