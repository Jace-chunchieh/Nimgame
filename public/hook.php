<?php
/**
 * XOR NIM 部署 WebHook 入口
 * GitHub 推送后访问 /hook.php?access_key=<密钥> 触发服务器自动部署
 * 密钥从 /www/wwwroot/hook.key 读取（不入库、不被部署脚本覆盖）
 */
$keyFile = '/www/wwwroot/hook.key';
$key = trim(@file_get_contents($keyFile));

if (!$key || ($_GET['access_key'] ?? '') !== $key) {
    http_response_code(403);
    exit('forbidden');
}

$log = '/www/wwwroot/deploy.log';
$cmd = 'export PATH=$PATH:/www/server/nodejs/v18.20.4/bin:/www/server/nodejs/v20.11.0/bin:/usr/local/bin:/usr/bin:/bin; '
     . 'bash /www/wwwroot/nimgame-src/scripts/deploy.sh /www/wwwroot/Nimgame >> ' . $log . ' 2>&1 &';

shell_exec($cmd);
echo 'deploy triggered';
