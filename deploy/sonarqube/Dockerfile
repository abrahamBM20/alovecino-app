FROM sonarqube:community

COPY render-start.sh /opt/render-start.sh
RUN chmod +x /opt/render-start.sh

ENTRYPOINT ["/opt/render-start.sh"]
