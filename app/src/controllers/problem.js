
function judge(req, res) {
    console.log(req.body);
    res.send(req.body);
}

export { judge };