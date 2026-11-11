# Cài đặt. Paddle GPU phụ thuộc phiên bản CUDA của Colab: nếu dòng paddlepaddle-gpu lỗi,
# lấy lệnh đúng ở trang cài đặt chính thức của PaddlePaddle (chọn CUDA khớp với `!nvidia-smi`).
!pip -q install rapidfuzz opencv-python-headless requests pandas
!pip install paddlepaddle-gpu==3.3.0 -i https://www.paddlepaddle.org.cn/packages/stable/cu130/ --default-timeout=1000 --retries 10