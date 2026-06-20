import { motion } from 'framer-motion';

const orgData = {
  name: 'CEO',
  role: 'Chief Executive Officer',
  children: [
    {
      name: 'CTO',
      role: 'Chief Technology Officer',
      children: [
        { name: 'VP Eng', role: 'VP of Engineering' },
        { name: 'VP Prod', role: 'VP of Product' }
      ]
    },
    {
      name: 'CFO',
      role: 'Chief Financial Officer',
      children: [
        { name: 'VP Finance', role: 'VP of Finance' }
      ]
    }
  ]
};

const OrgNode = ({ node }: any) => {
  return (
    <div className="flex flex-col items-center">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="bg-card/80 backdrop-blur-md border border-primary/20 px-4 py-2 rounded-lg shadow-sm text-center min-w-[120px] relative z-10"
      >
        <div className="font-bold text-foreground text-sm">{node.name}</div>
        <div className="text-xs text-muted-foreground">{node.role}</div>
      </motion.div>
      {node.children && (
        <>
          <div className="w-px h-6 bg-border"></div>
          <div className="flex justify-center border-t border-border pt-4 relative">
            {node.children.map((child: any, index: number) => (
              <div key={index} className="flex flex-col items-center px-4 relative">
                {/* Connecting lines for siblings */}
                <div className="absolute top-0 w-full h-px bg-border -mt-4"></div>
                <div className="w-px h-4 bg-border -mt-4 absolute top-0"></div>
                <OrgNode node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const OrgStructureChart = () => {
  return (
    <div className="w-full mt-4 flex justify-center overflow-x-auto p-4">
      <div className="min-w-max">
        <OrgNode node={orgData} />
      </div>
    </div>
  );
};
