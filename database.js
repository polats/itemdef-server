const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

Grid.mongo = mongoose.mongo
var mc = mongoose.connection;
var gfs;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
  mc.once('open', () => {
    gfs = Grid(mc.db)
    connection.gfs = gfs
});

const connection = {mc, gfs}

module.exports = connection
