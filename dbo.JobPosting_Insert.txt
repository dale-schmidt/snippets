ALTER PROC [dbo].[JobPosting_Insert]
			@CompanyId INT
			,@PositionName NVARCHAR(100)
			,@StreetAddress NVARCHAR(100) = null
			,@City NVARCHAR(50) = null
			,@StateProvinceId INT = null
			,@CountryId INT = null
			,@Compensation INT = null
			,@CompensationRateId INT = null
			,@FullPartId INT = null
			,@ContractPermanentId INT = null
			,@ExperienceLevelId INT = null
			,@Description NVARCHAR(4000) = null
			,@Responsibilities NVARCHAR(4000) = null
			,@Requirements NVARCHAR(4000) = null
			,@ContactInformation NVARCHAR(4000) = null
			,@Latitude DECIMAL(10,7) = null
			,@Longitude DECIMAL(10,7) = null
			,@JobPostingStatusId INT = null
			,@UserIdCreated NVARCHAR(128) = null
			,@JobPostingJobTagIds dbo.IntIdTable READONLY
			,@Id INT OUTPUT

AS

/* Test code

DECLARE		@CompanyId INT = 51
			,@PositionName NVARCHAR(100) = 'Test Position'
			,@StreetAddress NVARCHAR(100) = '123 Fake Street'
			,@City NVARCHAR(50) = 'New York City'			
			,@StateProvinceId INT = 54
			,@CountryId INT = 247
			,@Compensation INT = 80
			,@CompensationRateId INT = 1
			,@FullPartId INT = 2
			,@ContractPermanentId INT = 1
			,@ExperienceLevelId INT = 2
			,@Description NVARCHAR(4000) = 'Test Description'
			,@Responsibilities NVARCHAR(4000) = 'Test Responsibilities'
			,@Requirements NVARCHAR(4000) = 'Test Requirements'
			,@ContactInformation NVARCHAR(4000) = 'Test Contact'
			,@Latitude DECIMAL(10,7)
			,@Longitude DECIMAL(10,7)
			,@JobPostingStatusId INT = 1
			,@UserIdCreated NVARCHAR(128) = '123'
			,@JobPostingJobTagIds dbo.IntIdTable
			,@Id INT
			INSERT @JobPostingJobTagIds (data)
			VALUES (4), (5)

EXECUTE dbo.JobPosting_Insert
			@CompanyId
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
		   ,@Latitude
		   ,@Longitude
		   ,@JobPostingStatusId
		   ,@UserIdCreated
		   ,@JobPostingJobTagIds
		   ,@Id OUTPUT

SELECT *
FROM dbo.JobPosting
WHERE Id = @Id

*/

BEGIN
	
	DECLARE @Location GEOGRAPHY
	SET @Location = geography::Point(@Latitude, @Longitude, 4326);

	INSERT INTO [dbo].[JobPosting]
			   ([CompanyId]
			   ,[PositionName]
			   ,StreetAddress
			   ,[City]
			   ,StateProvinceId
			   ,CountryId
			   ,Compensation
			   ,CompensationRateId
			   ,FullPartId
			   ,ContractPermanentId
			   ,ExperienceLevelId
			   ,[Description]
			   ,[Responsibilities]
			   ,[Requirements]
			   ,[ContactInformation]
			   ,Location
			   ,[JobPostingStatusId]
			   ,[UserIdCreated])
		 VALUES
			   (@CompanyId
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
			   ,@Responsibilities
			   ,@Requirements
			   ,@ContactInformation
		       ,@Location
			   ,@JobPostingStatusId
			   ,@UserIdCreated)

			   SET @Id = SCOPE_IDENTITY()

			   INSERT INTO dbo.JobPostingJobTag (JobPostingId, JobTagId)
			   SELECT @Id, data
			   FROM @JobPostingJobTagIds

END