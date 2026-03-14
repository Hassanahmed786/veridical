import { motion } from 'framer-motion';

const categories = [
  { name: 'Genocide', color: '#E53535' },
  { name: 'War Crimes', color: '#E8873A' },
  { name: 'State Terror', color: '#C8762A' },
  { name: 'Slavery', color: '#9B6FD4' },
  { name: 'Colonial Atrocity', color: '#D4A017' },
  { name: 'Organized Crime', color: '#836EF9' },
];

const CategoryLegend = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7, duration: 0.4 }}
      className="fixed left-4 top-1/4 z-20"
    >
      <div className="bg-bg-surface border border-border-glow rounded-lg p-4 backdrop-blur-md">
        <h3 className="text-monad-glow font-display text-sm mb-3 uppercase tracking-wider">Categories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              ></div>
              <span className="text-text-secondary text-sm font-body">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryLegend;