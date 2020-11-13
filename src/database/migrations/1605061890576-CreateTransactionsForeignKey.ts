import {MigrationInterface, QueryRunner, TableForeignKey} from "typeorm";

export class CreateTransactionsForeignKey1605061890576 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {

      await queryRunner.createForeignKey('transactions', new TableForeignKey({
        name: 'TransactionsForeignKey',
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    }))

    }

    public async down(queryRunner: QueryRunner): Promise<any> {
      await queryRunner.dropForeignKey('transactions', 'TransactionsForeignKey');
    }

}
