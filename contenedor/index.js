const fs = require('fs');
const knex = require('knex');
class Contenedor {
    constructor(config, tableName) {
        this.config = config;
        this.tableName = tableName;
        this.knex = knex(this.config);
    }

    async getAll() {
        try {
            const columns = await this.knex.from(this.tableName).select('*');
            return columns;

        } catch (err) {
            throw new Error(err);
        }
    }

    async save(content) {
        try {
            const data = await this.knex(this.tableName).insert(content);
            return data;
        } catch (err) {
            throw new Error(err)
        }
    }

    async updateById(content) {

        try {
            await this.knex.from(this.tableName).update(content).update()
            return true
        } catch (err) {
            throw new Error(err)
        }
    }

    async getById(id) {
        try {
            const data = await this.knex.from(this.tableName).select().table(this.tableName).where('id', id).first();
            return data;
        } catch (error) {
            throw new Error(err)
        }
    }

    async deleteById(id) {
        try {
            const data = await this.knex.from(this.tableName).where('id', '=', id).del();
            return data;
        } catch (error) {
            throw new Error(err)
        }
    }

    async deleteAll() {
        try {
            await this.knex.from(this.tableName).del()
        } catch (error) {
            throw new Error(err)
        }
    }
}

module.exports = Contenedor;