import { Polybase } from '@polybase/client'

const db = new Polybase({
    defaultNamespace: "dappnet-config"
})

const createResponse = await db.applySchema(`
  collection Config {
    id: string;

    @index(name);

    constructor (id: string, name: string) {
      this.id = id;
      this.name = name;
    }

    setCountry (country: string) {
      this.country = country;
    }
  }
`, 'your-namespace') // your-namespace is optional if you have defined a default namespace