module.exports = function find(req, res) {
  Widget.count().then((count) => {
    const skip = Number(req.param('skip'));
    Widget.find({ skip: skip, limit: req.param('limit') }).then((records) => {
      res.set({ 'Content-Range': `records ${skip + 1}-${skip + records.length}/${count}` });
      return res.json(records);
    });
  });
};