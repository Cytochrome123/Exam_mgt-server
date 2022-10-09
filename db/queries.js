const queries = {
    findOne: async (model,condition,projection,options) => {
        return model.findOne(condition, projection, options);
    },

    create: async (model, data) => {
        return new model(data).save();
    },

    find: async(model,conditions,projection,options) => {
        return model.find(conditions,projection,options);
    },

    update: async (model, id, update, options) => {
        return model.findByIdAndUpdate(id, update, options)
    },

    findOneAndUpdate: async (model, conditions, update, options) => {
        return model.findOneAndUpdate(conditions, update, options);
    },

    countDocuments: (model, condition) => {
		return model.countDocuments(condition);
	},

    aggregateData: async (model, pipeline, options) => {
        return model.aggregate(pipeline, options)
    },

    populateData: (model, query, projection, options, collectionOptions) => {
		return model
			.find(query, projection, options)
			.populate(collectionOptions)
			.exec();
	},

    aggregateDataAndPopulate: (model, pipeline, populateOptions) => {
		return new Promise((resolve, reject) => {
			model.aggregate(pipeline, (err, data) => {
				if (err) {
					reject(err);
				}
				model.populate(data, populateOptions, (err, populatedDocs) => {
					if (err) reject(err);
					resolve(populatedDocs);
				});
			});
		});
	},

    delete: (model, condition, options) => {
        return model.findByIdAndDelete(condition, options);
    }
}

module.exports = queries;