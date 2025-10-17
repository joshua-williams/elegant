# Elegant Contributors

## Typescript Watch

A custom typescript watch function is used in this project. Call this script instead of the `tsc-watch` to ensure the `resources` directory gets copied to the `dist` directory after each successful build.

```bash
npm run watch
```

## Publish Documentation

The documentation for this project is written in Jetbrains Writerside. To compile these documents into a html website we have to run the build with `jetbrains/writerside-builder:latest` Docker container. This is configured in the `docker-compose.yml`. 

### Build Documentation 
```bash
npm run docs:build
```
This will run the following commands:
```bash
# clean output directory
rm -rf docs/* 
# remove previous jetbrains/writerside-builder docker container
docker compose down 
# start jetbrains/writerside-builder docker container and run build
docker compose up -d
# unzip the build artifacts into the docs directory
unzip -o docs/webHelpElegant2-all.zip -d docs
# remove build artifacts
rm -rf docs/webHelpE2-all.zip docs/algolia-indexes-ELEGANT.zip

# create CNAME file which is required for Github pages custom domain
echo 'elegant.pristine.technology' > docs/CNAME
```
### Publish to Github Pages
The repository has been configured to automatically deploy when changes are pushed to the `docs` branch. 

> **Diverge Warning**
>
> The `docs` branch should be up-to-date with `develop` so before making any changes to the `docs` branch be sure to have the lates `develop` branch merged in so that the `docs` branch do not diverge
>
> {style="warning"}
