# SBOM-in-a-Box GUI
> The **SBOM-in-a-Box** is a unified platform to promote the
> production, consumption, and utilization of Software Bills of Materials.
> This includes conversion between schemas, generation, comparision and evaluation of quality.

# Purpose of SBOM-in-a-Box
> SBOM-in-a-box has unique features including generation of SBOMs using multiple tools that allow for a more a complete SBOM to be created. There is also a feature within metrics, where the tool provides suggestions if there is a potential better way to showcase the attributes. There is also the ability to convert between SPDX and CycloneDX SBOM schemas, and to gain insight into vulnerabilities of software through SBOMs. These features allow for developers to create an SBOM that is the most relevant and suits their needs.

# SBOM-in-a-Box GUI 
This serves as the front-end and human interaction with our software.

### Latest Release: [[v1.2.1] - (11/30/23)](doc/changelog.md)

### System Requirements

- Node: ^18.19.1 || ^20.11.1 || ^22.0.0

### Quick Start

1. Follow the [SBOM-in-a-Box API](https://github.com/SoftwareDesignLab/SVIP/tree/main#quick-start) quick start to launch the backend
2. `npm ci`
3. `npm start`

## Features

- **Open Source Integrated SBOM Generation:** Makes use of open source libraries to generate SBOMs
- **SBOM Generation:** Custom SBOM generation via source file and package manager file analysis
- **SBOM VEX Generation:** Generate VEX documents for projects
- **SBOM Metrics:** Grade SBOMs using a series of metric tests
- **SBOM Comparison:** Compare SBOMs to identify key differences between them
- **SBOM Merging:** Merge SBOMs into a single unified document


## Development Build

1. Run `npm run winBuildExe`

## Contributors
**Project Lead:** [Mehdi Tarrit Mirakhorli](https://mehdimirakhorli.github.io/)

**Senior Project Manager:** Chris Enoch 

**Senior Developer Team Lead:** Derek Garcia

**Developer Team**

- Orion DiLorenzo
- Justin Jantzi
- Fabi Marrufo
- Max Stein
