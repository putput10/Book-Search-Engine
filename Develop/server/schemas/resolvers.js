const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, { _id }) => {
      return User.findOne({ _id }).select('-__v -password');
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, { newBook }) => {
      const userBooks = await User.findByIdAndUpdate(
        {_id: user },
        { $addToSet: { savedBooks: newBook }},
      );

      return userBooks;
    },
    removeBook: async (parent, { bookId }) => {
      return User.findOneAndDelete({ savedBooks: bookId });
    },
  },
};

module.exports = resolvers;
