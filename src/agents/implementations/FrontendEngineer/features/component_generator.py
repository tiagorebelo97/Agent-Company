import os

class ComponentGenerator:
    def __init__(self, agent):
        self.agent = agent

    def generate(self, description, path=None):
        """Generates a React component file using MCP"""
        
        file_path = path or f"src/components/{self._sanitize_filename(description)}.jsx"
        
        # In a real scenario, this would use an LLM to generate the code.
        # For now, we use a smart template.
        code = self._get_template(description)
        
        try:
            self.agent.log(f"Writing component to {file_path}")
            result = self.agent.call_mcp_tool('filesystem', 'write_file', {
                'path': file_path,
                'content': code
            })
            return {'status': 'success', 'file': file_path}
        except Exception as e:
            self.agent.log(f"Error writing file: {e}")
            return {'status': 'error', 'message': str(e)}

    def _sanitize_filename(self, description):
        """Turn description into a filename"""
        # Remove spaces and special chars, PascalCase
        words = description.replace('Create ', '').replace('Build ', '').split()
        # Filter out extremely common words if needed or just join
        clean_words = [w for w in words if w.isalnum()]
        return "".join(w.capitalize() for w in clean_words) or "GeneratedComponent"

    def _get_template(self, description):
        name = self._sanitize_filename(description)
        return f"""import React, {{ useState }} from 'react';

// Component: {name}
// Description: {description}

const {name} = () => {{
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 transition-all hover:shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-xl">
          ⚛️
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          {name}
        </h2>
      </div>
      
      <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex gap-3">
        <button 
          onClick={{() => setIsLoading(!isLoading)}}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {{isLoading ? (
             <>
               <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin"/>
               Loading...
             </>
          ) : (
            'Interact'
          )}}
        </button>
        <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}};

export default {name};
"""
