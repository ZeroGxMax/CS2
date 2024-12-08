# CASE STUDY 2
Dưới đây là một chương trình có nhiệm vụ chuyển file ảnh tiếng Anh sang một file `pdf` tiếng Việt. Các bước xử lý lần lượt bao gồm: chuyển đổi ảnh sang text, dịch tiếng Anh sang tiếng Việt, chuyển đổi nội dung text thành file `pdf`. Chương trình chính chỉ demo các tính năng này tuần tự.

## Hướng dẫn cài đặt
Yêu cầu cài đặt trước [tesseract](https://tesseract-ocr.github.io/tessdoc/Installation.html) trên hệ điều hành của bạn. 

```sh
# Cài đặt các gói liên quan
$ npm install
# Tạo folder cho output
$ mkdir output
# Khởi chạy ứng dụng demo
$ npm start
```

## Mô Tả
| File | Chức năng |
|--|:--|
| utils/ocr.js | Chuyển đổi ảnh sang text |
| utils/translate.js | Dịch tiếng Anh sang tiếng Việt |
| utils/pdf.js | Chuyển đổi text sang PDF |

## Yêu cầu
 - Hoàn thiện chương trình sử dụng `express.js` cho phép upload một file ảnh và trả về một file `pdf` tương ứng
 - Sử dụng `Pipes and Filters pattern` và `message queue` để hoàn thiện chương trình trên.


# Hướng Dẫn Chạy Hệ Thống

## 1. Cài Đặt Kafka  
- Tải Kafka từ Confluent tại [đây](https://docs.confluent.io/platform/current/installation/installing_cp/zip-tar.html).  

---

## 2. Khởi Chạy Kafka Server  
Mở terminal và thực hiện các lệnh sau:

```bash
# Khởi chạy Zookeeper
$KAFKA_HOME/bin/zookeeper-server-start $KAFKA_HOME/etc/kafka/zookeeper-bash.properties

# Khởi chạy Kafka Server
$KAFKA_HOME/bin/kafka-server-start $KAFKA_HOME/etc/kafka/server-0-1.properties

# Tạo topic OCR
$KAFKA_HOME/bin/kafka-topics --create --bootstrap-server localhost:9092 --topic ocr_topic --partitions 10 --replication-factor 1

# Tạo topic Translate
$KAFKA_HOME/bin/kafka-topics --create --bootstrap-server localhost:9092 --topic translate_topic --partitions 10 --replication-factor 1

# Tạo topic PDF
$KAFKA_HOME/bin/kafka-topics --create --bootstrap-server localhost:9092 --topic pdf_topic --partitions 10 --replication-factor 1

```

## 3. Cài Đặt Thư Viện
Cài đặt các thư viện cần thiết bằng lệnh:
```bash
npm install
```

## 4. Khởi Chạy Worker
Chạy file sau để khởi tạo các worker:
```bash
node spawnWorkers
```

## 5. Chạy Ứng Dụng Chính
Chạy ứng dụng bằng lệnh:
```bash
node index.js
```

## 6. Tải Ảnh và Xử Lý
Truy cập địa chỉ `localhost:3000`, upload ảnh cần OCR và chờ kết quả.

## 7. Xem Kết Quả
Kết quả sẽ được lưu trong thư mục `output`.