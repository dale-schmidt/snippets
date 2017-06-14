ALTER PROC [dbo].[JobPosting_Update]
			@Id INT
			,@CompanyId INT
			,@PositionName NVARCHAR(100)
			,@StreetAddress NVARCHAR(100)
			,@City NVARCHAR(50)
			,@StateProvinceId INT
			,@CountryId INT
			,@Compensation INT
			,@CompensationRateId INT
			,@FullPartId INT
			,@ContractPermanentId INT
			,@ExperienceLevelId INT
			,@Description NVARCHAR(4000)
			,@Responsibilities NVARCHAR(4000)
			,@Requirements NVARCHAR(4000)
			,@ContactInformation NVARCHAR(4000)
			,@Latitude DECIMAL(10,7)
			,@Longitude DECIMAL(10,7)
			,@JobPostingStatusId INT
			,@JobPostingJobTagIds dbo.IntIdTable READONLY
			

AS

/* Test code


DECLARE		@Id INT = 13
			,@CompanyId INT = 51
			,@PositionName NVARCHAR(100) = 'Test Pos'
			,@StreetAddress NVARCHAR(100) = '11755 Wilshire Blvd.'
			,@City NVARCHAR(50) = 'Los Angeles'
			,@StateProvinceId INT = 9
			,@CountryId INT = 247
			,@Compensation INT = 80000
			,@CompensationRateId INT
			,@FullPartId INT
			,@ContractPermanentId INT
			,@ExperienceLevelId INT
			,@Description NVARCHAR(4000)
			,@Responsibilities NVARCHAR(4000) = 'Test Resp'
			,@Requirements NVARCHAR(4000) = 'Test Req'
			,@ContactInformation NVARCHAR(4000) = 'Test Con'
			,@JobPostingStatusId INT = 1
			,@JobPostingJobTagIds dbo.IntIdTable
			INSERT @JobPostingJobTagIds (data)
			VALUES (5), (6)
			
SELECT *
FROM dbo.JobPostingJobTag
WHERE JobPostingId = @Id

EXECUTE dbo.JobPosting_Update
			@Id
		   ,@CompanyId
		   ,@PositionName
		   ,@StreetAddress
		   ,@City
		   ,@StateProvinceId
		   ,@CountryId
		   ,@Compensation
		   ,@CompensationRateId
		   ,@FullPartId
		   ,@ContractPermanentId
		   ,@ExperienceLevelId
		   ,@Description
		   ,@Requirements
		   ,@Requirements
		   ,@ContactInformation
		   ,@JobPostingStatusId
		   ,@JobPostingJobTagIds

SELECT *
FROM dbo.JobPostingJobTag
WHERE JobPostingId = @Id

SELECT *
FROM dbo.JobPosting
WHERE Id = @Id

*/

BEGIN

	UPDATE [dbo].[JobPosting]
	   SET CompanyId = @CompanyId
		  ,[PositionName] = @PositionName
		  ,StreetAddress = @StreetAddress
		  ,[City] = @City
		  ,[StateProvinceId] = @StateProvinceId
		  ,[CountryId] = @CountryId
		  ,Compensation = @Compensation
		  ,CompensationRateId = @CompensationRateId
		  ,FullPartId = @FullPartId
		  ,ContractPermanentId = @ContractPermanentId
		  ,ExperienceLevelId = @ExperienceLevelId
		  ,[Description] = @Description
		  ,[Responsibilities] = @Responsibilities
		  ,[Requirements] = @Requirements
		  ,[ContactInformation] = @ContactInformation
		  ,[JobPostingStatusId] = @JobPostingStatusId
		  ,[DateModified] = GETUTCDATE()
	 WHERE Id = @Id

	 DELETE FROM dbo.JobPostingJobTag
	 WHERE JobPostingId = @Id

	 INSERT INTO dbo.JobPostingJobTag (JobPostingId, JobTagId)
	 SELECT @Id, data
	 FROM @JobPostingJobTagIds



END