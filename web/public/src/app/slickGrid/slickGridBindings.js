import { createViewModel } from 'scalejs.metadataFactory';
import { observable } from 'knockout';
import sandbox from 'scalejs.sandbox';

export default {
	'grid-binding': function (ctx) {
        return {
            slickGrid: {
                columns: this.columns,
				options: this.options,
				data: this.data,
				dictionary: this.dictionary
            }
        };
    },
};
