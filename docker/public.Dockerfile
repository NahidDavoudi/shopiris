FROM nginx:1.27-alpine

COPY docker/nginx-public.conf /etc/nginx/conf.d/default.conf

COPY index.html login.html admin.html /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 80