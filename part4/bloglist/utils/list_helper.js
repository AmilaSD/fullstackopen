const _ = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, post) => sum + post.likes, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null;

  return blogs.reduce(
    (fav, post) => (post.likes > fav.likes ? post : fav),
    blogs[0]
  );
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null;
  const authorCounts = _.countBy(blogs, "author");

  const topAuthor = _.maxBy(
    Object.keys(authorCounts),
    (author) => authorCounts[author]
  );
  return { author: topAuthor, blogs: authorCounts[topAuthor] };
};

const mostLikes = (blogs) => {
    if (blogs.length === 0) return null;

    const authorLikes = _.groupBy(blogs, 'author');

    const likesPerAuthor = _.map(authorLikes, (posts, author) => {
    return {
      author: author,
      likes: _.sumBy(posts, 'likes')
    }
  })
  const topAuthor = _.maxBy(likesPerAuthor, 'likes')
  return {
    author: topAuthor.author,
    likes: topAuthor.likes
  }
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
};
