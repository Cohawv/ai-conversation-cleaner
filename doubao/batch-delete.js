(async () => {
  const BATCH = 20;
  const PAUSE = 1300;

  while(true) {
    let ids = Array.from(
      new Set(
        Array.from(document.querySelectorAll('*'))
          .flatMap(el => el.outerHTML.match(/\b\d{15,20}\b/g) || [])
      )
    );

    if (ids.length === 0) {
      console.log('✅ 已经没有可删对话，全部完成');
      break;
    }

    console.log(`本轮待删：${ids.length} 条，每次删 ${BATCH} 条`);
    const toDelete = ids.slice(0, BATCH);
    let success = 0;

    for (const id of toDelete) {
      try {
        // web_tab_id 改用随机生成，去除个人标识
        const tabId = crypto.randomUUID();
        const res = await fetch(
          `https://www.doubao.com/im/conversation/batch_del_user_conv?version_code=20800&language=zh&device_platform=web&aid=497858&real_aid=497858&pkg_type=release_version&pc_version=3.12.3&web_tab_id=${tabId}`,
          {
            method: "POST",
            headers: {
              "accept": "application/json, text/plain, */*",
              "content-type": "application/json; encoding=utf-8",
              "referer": "https://www.doubao.com/chat/thread/list"
            },
            body: JSON.stringify({
              "cmd": 4171,
              "uplink_body": {
                "batch_delete_user_conversation_uplink_body": {
                  "conversation_id": [id],
                  "delete_all": false,
                  "conversation_type": 3
                }
              },
              "sequence_id": crypto.randomUUID(),
              "channel": 2,
              "version": "1"
            }),
            credentials: "include"
          }
        );
        const data = await res.json();
        if (data.status_desc === "OK") success++;
        console.log(id, '✅ 已删');
      } catch (e) {
        console.log(id, '❌ 删除失败，跳过');
      }
      await new Promise(r => setTimeout(r, PAUSE));
    }

    console.log(`\n本轮删除完成：${success} 条，继续下一批...`);
    await new Promise(r => setTimeout(r, 2500));
  }
})();


