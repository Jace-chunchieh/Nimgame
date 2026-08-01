<?php
/**
 * XOR NIM 部署 WebHook 入口（安全模式：不调用任何 shell 函数）
 * GitHub 推送后访问 /hook.php?access_key=<密钥>
 * 校验通过后写入部署标记文件，由宝塔计划任务（每分钟）检测并执行部署
 */
$keyFile = ($_SERVER['DOCUMENT_ROOT'] ?? '/www/wwwroot/Nimgame') . '/hook.key';
$key = trim(@file_get_contents($keyFile));

if (!$key || ($_GET['access_key'] ?? '') !== $key) {
    http_response_code(403);
    exit('forbidden');
}

$marker = ($_SERVER['DOCUMENT_ROOT'] ?? '/www/wwwroot/Nimgame') . '/.deploy_trigger';
@file_put_contents($marker, (string)time());
echo 'deploy triggered';
