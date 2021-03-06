const ase = require('apollo-server-express');
const promisesAll = require('promises-all');
const _ = require('lodash');
const mongoose = require('mongoose');

const ItemDefinition = require('./models/itemDefinition');
const ItemInstance = require('./models/itemInstance');
const Comment = require('./models/comment');
const Post = require('./models/post');
const User = require('./models/user');
const connection = require('./database');

const storeFS = ({ stream, filename, mimetype }) => {

  var writeStream = connection.gfs.createWriteStream({
    filename: filename,
    mode: 'w',
    content_type: mimetype
  })

  stream
    .on('error', error => {
      reject(error)
    })
    .pipe(writeStream)

  return new Promise((resolve, reject) =>
      writeStream.on('error', error => reject(error))
      .on('close', file => resolve(file))
  )
}

const processUpload = async upload => {
  const { createReadStream, filename, mimetype } = await upload
  const stream = createReadStream()
  const file = await storeFS({ stream, filename, mimetype })

  return file
}

const addItemDefinition = (input) => {

  const newItemDefinition = new ItemDefinition({
    name: input.name,
    description: input.description,
    external_url: input.external_url,
    image: input.image
  })

  return newItemDefinition.save()
}

const addItemDefinitionViaJson = (json) => {

  var jsonObject = Object.values(JSON.parse(json))[0];
  var itemDefinitionArray = [];

  jsonObject.map( (itemDef) => {
    var newItemDefinition = new ItemDefinition({
      id: itemDef.id,
      name: itemDef.name,
      description: itemDef.desc,
      image: itemDef.image,
      otherProps: JSON.stringify(itemDef)
    });

    newItemDefinition.save();
    itemDefinitionArray.push(newItemDefinition);
  });

  return itemDefinitionArray;
}

const addItemInstance = (input) => {

  const newItemInstance = new ItemInstance({
    token_id: input.token_id,
    def_id: input.def_id
  })

  return newItemInstance.save()
}

const getAllItems = () => {

  return ItemInstance.find({}).exec().then(itemInstances => {

    var itemDefIds = [];

     itemInstances.map(itemInstance => {
       itemDefIds.push(itemInstance.def_id)
     })

     var allItems = []

     return ItemDefinition.find()
       .where('_id')
       .in(itemDefIds)
       .exec()
       .then(itemDefinitions => {

         itemInstances.map(itemInstance => {
           var itemDefinition = itemDefinitions.find(obj => obj._id.equals(itemInstance.def_id))

            var item = {
              id: itemInstance.collection_id,
              instance_id: itemInstance._id,
              name: itemDefinition.name,
              description: itemDefinition.description,
              external_url: itemDefinition.external_url,
              image: itemDefinition.image
            }

            allItems.push(item)
         })

         return allItems
       })
  })
}

async function getAllFiles() {
  const allFiles = await connection.gfs.files.find({}).toArray()
  return allFiles
}

module.exports = {
  Upload: ase.GraphQLUpload,

  Query: {
    async uploads() {
      return await getAllFiles()
    },

    me: (root, args, {userId}) => {
      if (!userId) {
        return null;
      }
      return {
        _id: userId,
      };
    },
    post: (root, {postId} ) => { return Post.findOne( {_id: postId} ) } ,
    posts: () => { return Post.find( {} ) },
    comment: (root, {commentId}) => { return Comment.findOne( {_id: commentId} ) },


    itemDefinitions: () => { return ItemDefinition.find( {} ) },
    itemInstances: () => { return ItemInstance.find( {} ) },
    allItems: () => getAllItems()
  },

  Post: {
    comments: ({ _id }) => {return Comment.find( { postId: _id }) }
  },

  Comment: {
    post: ({ postId }) => { return Post.findOne( { _id: postId }) },
  },

  Mutation: {
    singleUpload: (obj, { file }) => processUpload(file),

    async multipleUpload(obj, { files }) {
      const { resolve, reject } = await promisesAll.all(
        files.map(processUpload)
      )

      if (reject.length)
        reject.forEach(({ name, message }) =>
          // eslint-disable-next-line no-console
          console.error(`${name}: ${message}`)
        )

      return resolve
    },

    addItemDefinition: (root, args) => addItemDefinition(args.input),
    addItemDefinitionViaJson: (root, args) => addItemDefinitionViaJson(args.json),
    addItemInstance: (root, args) => addItemInstance(args.input),

    createPost: (root, args, { userId }, info) => {
      if (!userId) {
        throw new Error('User not logged in.');
      }

      const newPost = new Post({
        authorId: userId,
        ...args
      })

      return newPost.save()
    },

    createComment: (root, args, { userId }) => {
      if (!userId) {
        throw new Error('User not logged in.');
      }
      args.authorId = userId;

      const newComment = new Comment({
        authorId: userId,
        ...args
      })

      return newComment.save()
    }
  }
}
