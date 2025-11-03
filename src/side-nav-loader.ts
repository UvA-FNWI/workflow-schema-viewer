import { Lookup } from "./lookup";
import { JsonSchema, JsonSchema1 } from './schema';
import { GroupSideNavLink, SideNavLink, SingleSideNavLink, Spacer } from "./SideNavWithRouter";
import { getTitle } from "./title";

export function extractLinks(schemas: JsonSchema[], lookup: Lookup): Array<SideNavLink> {
  const links = new Array<SideNavLink>();

  for (const schema of schemas) {
    if (typeof schema === 'boolean') continue;
    links.push({
      title: getTitle('#', schema),
      reference: `${schema.title}#`,
    });
  }
  links.push(Spacer);

  const definitionSchemas = schemas
    .filter(s => typeof s !== 'boolean' && s.definitions !== undefined) as JsonSchema1[];
  const definitionBlocks = definitionSchemas
    .map(s => (s as JsonSchema1).definitions);
  const definitions = Object.assign({}, ...definitionBlocks) as { [key: string]: JsonSchema };
  const keys = Object.keys(definitions).sort();

  if (definitionBlocks.length) {
    const children = new Array<SingleSideNavLink>();
    for (const key of keys) {
      for (const schema of definitionSchemas) {
        if (Object.prototype.hasOwnProperty.call(schema.definitions, key)) {
          const definition = schema.definitions![key];
          if (!definition || (definition as JsonSchema1)?.enum) continue;
          const reference = `${schema.title}#/definitions/${key}`;

          children.push({
            title: typeof definition === 'boolean' ? key : getTitle(reference, definition),
            reference,
          });
          break;
        }
      }
    }

    const topDefinitionsGroup: GroupSideNavLink = {
      title: 'Definitions',
      reference: undefined,
      children
    };

    links.push(topDefinitionsGroup);
  }

  return links;
}