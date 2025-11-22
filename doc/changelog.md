# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - (11/22/25)
### Added
- Security Dashboard that surfaces per-project vulnerability totals, severity cards, active alerts, and historical trends, powered by the new backend history endpoints.
- Severity filters, project dropdowns, and improved toast workflows so users can acknowledge alerts and pivot between SBOMs faster.

### Changed
- Optimized the Electron zip routine to skip `node_modules`/build artifacts before sending projects to OSI, drastically reducing upload times.
- Raised the Angular `anyComponentStyle` budget to 10kb to eliminate noisy build warnings from rich views like upload/viewer.

## [v1.2.1] - (11/29/23)
### Added
- Support for XML CDX SBOM's in Convert and Generate added 

## [v1.2.0] - (11/10/23)
### Added
 - Repair Button shows Repair Modal for fixing issues

## [v1.1.1] - (11/10/23)
- Change name from SVIP to SBOM-in-a-Box to better represent the platform

## [v1.1.0] - (9/28/23)
### Added
- Can download `vex` and `metrics` reports
- `Generate` SBOMS with both `OSI` and `Parsers`
- `Filter` added to metrics
- Can close opened menus on the right
- Loading spinners added as indicators
  
### Changed
- Corrected `Schema` header in file upload to `Format`
- Fixed various scaling issues with all display resolutions
- Removed `/frontend` folder and put `src` in root directory
- Accordions now automatically close when a sibling is opened

### Known Issues
- Repair Button doesn't do anything currently on metrics
- Generation modal may get stuck open on errors

## [v1.0.0] - (7/31/23)
### Added
- `Uploading` SBOMS
- `Viewing` SBOMS (Pretty and Raw View)
- `Convert` SBOM to new schema and document format
- `Run Quality` Assurance tests on SBOMs
- `Compare` multiple SBOMS
- `Merge` multiple SBOMs together
- `Download` download SBOMs

### Known Issues
- `Main View`: responsiveness issues for viewer, scrollbar goes off page
- `Main Window`: app is not vertically responsive

## [v0.0.0] - (5/22/23)
### Added
- `New Gui`: Created GUI Skeleton now utilizing Angular Bootstrap instead of Material Angular
- `Plugfest`: Merged Plugfest capabilities into SVIP

### Known Issues
- `Sidepanel`: Sidepanel may have information pop off the screen or not fully close
- `Comparison`: Information goes off screen and cannot be scrolled to
- `Navbar`: There is no indication of buttons being disabled
- `Vulnerabilities`: Vulnerabilities button is not shown to be disabled
