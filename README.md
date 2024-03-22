
元記事：https://qiita.com/daichiiiiiii/items/cd3d9798acd18bf59eb4#%E7%8F%BE%E5%9C%A8%E8%A6%8B%E3%81%A6%E3%81%84%E3%82%8B%E3%83%9A%E3%83%BC%E3%82%B8%E3%82%92%E3%81%9D%E3%81%AE%E3%81%BE%E3%81%BE%E5%85%B1%E6%9C%89%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B

# 現在見ているページをそのまま共有してみる

Boxには、あまり知られていない裏機能として、資料内の指定のページを共有する機能があるのをご存知でしたか？

[いくつ知ってる？Boxの隠れ便利機能5選 - Qiita](https://qiita.com/natsumib/items/516782b527d1a8269a50)

上記から抜粋：
```
ページ指定の場合
共有リンクのURL＋#p=XX
XXに指定のページ番号を入れてください。
例えば、10ページ目を共有したい場合はリンクの末尾に#p=10と記載
```


共有リンクの後ろに\#p=ページ番号　を付けて共有するとリンクを開いた相手はファイルの指定のページが直接開く仕組みになっています。



ただしBoxのUI上から直接ページ番号の指定できず、自分で共有リンクの後ろに付け加える必要がある。
UI上からもページ番号指定できるようになるよと言われて何月年経ったどうか。。。実装される気配がない。


そしたら自分で実装してしまえということで、今見ているページの共有リンクを作成できるChrome拡張機能作ってみました。

画像：
![CleanShotiQ5XRQvb.gif](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/227518/4f807278-4da6-c384-25e9-ef3543f98f1a.gif)



よかったら使ってみてね。

[Chrome ウェブストア - 拡張機能 (google.com)](https://chrome.google.com/webstore/detail/share-page-number/oiglgnpdmicmcbolibbjkmdancpbogdp)



いきおいで作ったのであまりきれいな作りじゃないけど、バグや機能改善などあればこちらにご連絡ください。

https://github.com/Band-Aid/share-box-page/tree/main
