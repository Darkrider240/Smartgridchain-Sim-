import React, { useState } from 'react';
import { Block, ValidationResult } from '../types';
import { ChevronDown, ChevronUp, Edit2, Save, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  blocks: Block[];
  validationStatus: ValidationResult;
  onTamper: (index: number, newData: string) => void;
}

interface BlockItemProps {
  block: Block;
  isInvalid: boolean;
  onTamper: (idx: number, s: string) => void;
}

const BlockItem: React.FC<BlockItemProps> = ({ block, isInvalid, onTamper }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState('');

  const handleEditClick = () => {
    setEditData(JSON.stringify(block.data, null, 2));
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleSave = () => {
    onTamper(block.index, editData);
    setIsEditing(false);
  };

  return (
    <div className={`border-l-4 rounded-r-lg mb-4 transition-all duration-300 ${
      isInvalid || block.isTampered
        ? 'border-red-500 bg-red-900/10' 
        : 'border-emerald-500 bg-slate-800/50'
    }`}>
      <div 
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => !isEditing && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
            isInvalid || block.isTampered ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'
          }`}>
            #{block.index}
          </div>
          <div>
            <div className="text-xs font-mono text-slate-500">HASH</div>
            <div className="text-xs font-mono text-slate-300 truncate w-32 md:w-48">
              {block.hash.substring(0, 16)}...
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isInvalid || block.isTampered ? <AlertTriangle size={18} className="text-red-500" /> : <CheckCircle size={18} className="text-emerald-500" />}
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
          <div className="space-y-3 text-xs font-mono">
            
            <div>
              <span className="text-slate-500 block mb-1">PREVIOUS HASH</span>
              <div className="break-all text-slate-400 bg-slate-950 p-2 rounded">{block.prevHash}</div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                 <span className="text-slate-500 block">DATA PAYLOAD</span>
                 {!isEditing ? (
                   <button onClick={handleEditClick} className="text-amber-500 hover:text-amber-400 flex items-center gap-1">
                     <Edit2 size={12} /> Tamper
                   </button>
                 ) : (
                   <button onClick={handleSave} className="text-red-500 hover:text-red-400 flex items-center gap-1">
                     <Save size={12} /> Save Invalid Block
                   </button>
                 )}
              </div>
              
              {isEditing ? (
                <textarea 
                  value={editData}
                  onChange={(e) => setEditData(e.target.value)}
                  className="w-full h-48 bg-slate-950 text-emerald-400 p-3 rounded border border-slate-700 focus:border-red-500 outline-none"
                />
              ) : (
                 <pre className="break-all text-emerald-400 bg-slate-950 p-3 rounded overflow-x-auto">
                  {JSON.stringify(block.data, null, 2)}
                </pre>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export const BlockchainViewer: React.FC<Props> = ({ blocks, validationStatus, onTamper }) => {
  // Reverse map to show newest first
  const reversedBlocks = [...blocks].reverse();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-800 shadow-xl h-full max-h-[800px] flex flex-col">
      <div className="p-5 border-b border-slate-800">
        <h2 className="text-xl font-bold text-slate-200">Blockchain Ledger</h2>
        <p className="text-xs text-slate-500 mt-1">
          {blocks.length} Blocks mined. 
          {validationStatus.isValid 
            ? <span className="text-emerald-500 ml-2">Chain Secure</span> 
            : <span className="text-red-500 ml-2 font-bold">Chain Broken at #{validationStatus.errorIndex}</span>}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {reversedBlocks.map((block) => (
          <BlockItem 
            key={block.index} 
            block={block} 
            isInvalid={!validationStatus.isValid && block.index >= (validationStatus.errorIndex || 9999)}
            onTamper={onTamper}
          />
        ))}
        {blocks.length === 0 && (
            <div className="text-center text-slate-500 py-10">Waiting for genesis block...</div>
        )}
      </div>
    </div>
  );
};