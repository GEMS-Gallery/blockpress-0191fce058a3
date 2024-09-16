export const idlFactory = ({ IDL }) => {
  const Category = IDL.Record({ 'name' : IDL.Text, 'description' : IDL.Text });
  const Post = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'body' : IDL.Text,
    'author' : IDL.Principal,
    'timestamp' : IDL.Int,
    'category' : IDL.Text,
  });
  return IDL.Service({
    'createPost' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
    'getCategories' : IDL.Func([], [IDL.Vec(Category)], ['query']),
    'getOwnPosts' : IDL.Func([], [IDL.Vec(Post)], ['query']),
    'getPost' : IDL.Func([IDL.Nat], [IDL.Opt(Post)], ['query']),
    'getPosts' : IDL.Func([], [IDL.Vec(Post)], ['query']),
    'getPostsByCategory' : IDL.Func([IDL.Text], [IDL.Vec(Post)], ['query']),
    'updatePost' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, IDL.Text],
        [IDL.Bool],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
