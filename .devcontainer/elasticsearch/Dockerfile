ARG VARIANT
FROM elasticsearch:${VARIANT}
RUN bin/elasticsearch-plugin install analysis-icu
RUN bin/elasticsearch-plugin install analysis-kuromoji
