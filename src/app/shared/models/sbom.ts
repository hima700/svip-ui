/** @Author Tina DiLorenzo */

export class SBOM implements ISBOM {
  [key: string]: any;

  format!: string;
  name!: string;
  uid!: string;
  version!: string | null;
  specVersion!: string;
  licenses!: string[];
  creationData!: {
    creationTime: string;
    authors: string[];
    manufacture: string | null;
    supplier: {
      name: string;
      url: string | null;
      contacts: {
        name: string;
        email: string | null;
        phone: string | null;
      }[];
    };
    licenses: string[];
    properties: {};
    creationTools: {
      vendor: string | null;
      name: string;
      version: string;
      hashes: {};
    }[];
    creatorComment: string | null;
  };
  documentComment!: string | null;
  rootComponent!: string | null;
  components!: {
    type: string | null;
    uid: string;
    author: string;
    name: string;
    licenses: {
      declared: string[];
      infoFromFiles: string[];
      concluded: string[];
      comment: string | null;
    };
    copyright: string;
    hashes: string | null;
    supplier: string | null;
    version: string;
    description: string | null;
    cpes: string[];
    purls: string[] | null;
    externalReferences: string | null;
    comment: string | null;
    attributionText: string | null;
    downloadLocation: string;
    fileName: string | null;
    filesAnalyzed: boolean;
    verificationCode: string | null;
    homePage: string | null;
    sourceInfo: string;
    releaseDate: string | null;
    builtDate: string | null;
    validUntilDate: string | null;
  }[];
  relationships!: {
    [component: string]: {
      otherUID: string;
      relationshipType: string;
      comment: string | null;
    }[];
  };

  constructor(sbom: ISBOM) {
    for (const [key, value] of Object.entries(sbom)) {
      this[key] = value;
    }
  }
}

export interface ISBOM {
  format: string;
  name: string;
  uid: string;
  version: string | null;
  specVersion: string | null
  licenses: string[];
  creationData: {
    creationTime: string | null
    authors: string[];
    manufacture: string | null;
    supplier: {
      name: string | null
      url: string | null;
      contacts: {
        name: string | null
        email: string | null;
        phone: string | null;
      }[];
    };
    licenses: string[];
    properties: {};
    creationTools: {
      vendor: string | null;
      name: string | null
      version: string | null
      hashes: {};
    }[];
    creatorComment: string | null;
  };
  documentComment: string | null;
  rootComponent: string | null;
  components: {
    type: string | null;
    uid: string | null
    author: string | null
    name: string | null
    licenses: {
      declared: string[];
      infoFromFiles: string[];
      concluded: string[];
      comment: string | null;
    };
    copyright: string | null
    hashes: string | null;
    supplier: string | null;
    version: string | null
    description: string | null;
    cpes: string[];
    purls: string[] | null;
    externalReferences: string | null;
    comment: string | null;
    attributionText: string | null;
    downloadLocation: string | null
    fileName: string | null;
    filesAnalyzed: boolean;
    verificationCode: string | null;
    homePage: string | null;
    sourceInfo: string | null
    releaseDate: string | null;
    builtDate: string | null;
    validUntilDate: string | null;
  }[];
  relationships: {
    [component: string]: {
      otherUID: string | null
      relationshipType: string | null
      comment: string | null;
    }[];
  };
}
