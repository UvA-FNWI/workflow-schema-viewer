import React, { ReactNode } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { JsonSchema } from './schema';
import Spinner from '@atlaskit/spinner';
import EmptyState from '@atlaskit/empty-state';
import { addRecentlyViewedLink } from './recently-viewed';

export type LoadSchemaProps = RouteComponentProps & {
   children: (schemas: JsonSchema[]) => ReactNode;
};

export type LoadSchemaError = {
   message: string;
};

export type LoadSchemaState = {
   results: ResultState[];
};

export type ResultState = {
   currentUrl: string;
   schema: JsonSchema | LoadSchemaError;
}

function isLoadSchemaError(e: JsonSchema | LoadSchemaError): e is LoadSchemaError {
   return typeof e !== 'boolean' && 'message' in e;
}

const targets = ["EntityType", "Form", "Role", "Screen", "Step", "ValueSet"];
const baseUrl = "https://raw.githubusercontent.com/UvA-FNWI/workflow-api/refs/heads/feature/DN-3406-schemas/Schemas/";

export const loadExample = async (type: string) => {
  try {
    const result = await fetch(`${baseUrl}Examples/${type}.yaml`);
    return await result.text();
  }
  catch {
    return null;
  }
}

class LoadSchemaWR extends React.PureComponent<LoadSchemaProps, LoadSchemaState> {
   state: LoadSchemaState = {
      results: []
   };

   componentDidMount() {
       this.loadData();
   }

   private async loadData() {
     for (const target of targets) {
       const url = `${baseUrl}${target}.json`;
       try {
         const resp = await fetch(url);
         const schema = await resp.json();
         this.setState((prevState) => ({
           results: [
             ...prevState.results,
             {
               currentUrl: url,
               schema
             }
           ]})
         );
       }
       catch (e) {
         this.setState((prevState) => ({ results: [...prevState.results, { currentUrl: url, schema: { message: (e as Error).message } }]}));
       }
     }
   }

   render() {
      const { results } = this.state;
      if (!results.length) {
         return (
            <EmptyState
               header="Loading schema..."
               description="Attempting to pull the JSON Schema down from the public internet."
               primaryAction={(
                  <Spinner size="xlarge" />
               )}
            />
         );
      }

      if (isLoadSchemaError(results[0].schema)) {
         return (
            <EmptyState
               header="Schema load failed"
               description="Attempted to pull the JSON Schema down from the public internet."
               primaryAction={(
                  <p>Error: {results[0].schema.message}</p>
               )}
            />
         );
      }

      const { children } = this.props;
      if (typeof children !== 'function') {
         throw new Error('The children of the LoadSchema must be a function to accept the schema.')
      }
      return <>{children(results.map(r => r.schema))}</>;
   }
}

export const LoadSchema = withRouter<LoadSchemaProps, typeof LoadSchemaWR>(LoadSchemaWR);
