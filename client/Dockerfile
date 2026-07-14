# Stage 1: Build ứng dụng React với Node phiên bản LTS ổn định
FROM node:lts-alpine AS build
WORKDIR /app

# Sao chép package.json VÀ TẤT CẢ các file lock nếu có (để giữ đúng phiên bản bản máy gốc)
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Cài đặt chính xác các package tuân thủ theo máy gốc của bạn
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Sử dụng Nginx để deploy production siêu nhẹ
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]