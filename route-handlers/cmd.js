const child_process = require("child_process");
const { getFileNameByParam } = require("../lib/helpers");

module.exports = (req, res) => {
  res.filename = getFileNameByParam(eq.params[0]);

  let cmd = req.body.cmd;
  if (!cmd || cmd.length < 1) {
    return res.status(400).end();
  }

  child_process.exec(
    cmd,
    {
      shell: shell, // refactor notes: what is this supposed to be?
      cwd: relative(res.filename),
      timeout: 60 * 1000,
    },
    (err, stdout, stderr) => {
      if (err) {
        req.flash("error", "Command failed due to non-zero exit code");
      }
      res.render(
        "cmd",
        flashify(req, {
          path: res.filename,
          cmd: cmd, // refactor notes: what is this supposed to be?
          stdout: stdout,
          stderr: stderr,
        })
      );
    }
  );
};
