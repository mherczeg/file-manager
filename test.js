const { rewriteCodec } = require("./lib/file-transform");

rewriteCodec('/home/herczeg/projects/personal/local-file-server-test-folder/WandaVision.S01E03.1080p.DSNP.WEB-DL.DDP5.1.Atmos.H.264-CMRG.mkv')
.then(console.log)
.catch(console.error)