<?php
/**
 * XOR NIM 部署 WebHook 入口
 * GitHub 推送后访问 /hook.php?access_key=<密钥> 触发服务器自动部署
 * 密钥从站点根目录下的 hook.key 读取（受 PHP open_basedir 限制，必须在站点目录内）
 */
$keyFile = ($_SERVER['DOCUMENT_ROOT'] ?? '/www/wwwroot/Nimgame') . '/hook.key';
$key = trim(@file_get_contents($keyFile));

if (!$key || ($_GET['access_key'] ?? '') !== $key) {
    http_response_code(403);
    exit('forbidden got=' . md5($_GET['access_key'] ?? '') . ' file=' . md5($key));
}

$log = '/www/wwwroot/deploy.log';
$cmd = 'export PATH=$PATH:/www/server/nodejs/v18.20.4/bin:/www/server/nodejs/v20.11.0/bin:/usr/local/bin:/usr/bin:/bin; '
     . 'bash /www/wwwroot/nimgame-src/scripts/deploy.sh /www/wwwroot/Nimgame >> ' . $log . ' 2>&1 &';

shell_exec($cmd);
echo 'deploy triggered';
